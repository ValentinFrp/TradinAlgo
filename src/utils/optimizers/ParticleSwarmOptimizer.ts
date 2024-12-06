import { Strategy, BacktestResult } from '../../types/trading';

interface Particle {
  position: Record<string, number>;
  velocity: Record<string, number>;
  bestPosition: Record<string, number>;
  bestFitness: number;
  currentFitness: number;
}

export class ParticleSwarmOptimizer {
  private readonly particleCount: number;
  private readonly inertia: number;
  private readonly cognitiveWeight: number;
  private readonly socialWeight: number;
  private readonly maxIterations: number;
  private globalBestPosition: Record<string, number>;
  private globalBestFitness: number;

  constructor(
    particleCount = 30,
    inertia = 0.729,
    cognitiveWeight = 1.49445,
    socialWeight = 1.49445,
    maxIterations = 50
  ) {
    this.particleCount = particleCount;
    this.inertia = inertia;
    this.cognitiveWeight = cognitiveWeight;
    this.socialWeight = socialWeight;
    this.maxIterations = maxIterations;
    this.globalBestPosition = {};
    this.globalBestFitness = -Infinity;
  }

  async optimize(
    strategy: Strategy,
    evaluateFunction: (params: Record<string, number>) => Promise<BacktestResult>
  ): Promise<{
    bestParameters: Record<string, number>;
    bestFitness: number;
    convergenceHistory: number[];
    particleHistory: Array<{
      iteration: number;
      particles: Array<{
        position: Record<string, number>;
        velocity: Record<string, number>;
        fitness: number;
      }>;
    }>;
  }> {
    let particles = this.initializeParticles(strategy);
    const convergenceHistory: number[] = [];
    const particleHistory: Array<{
      iteration: number;
      particles: Array<{
        position: Record<string, number>;
        velocity: Record<string, number>;
        fitness: number;
      }>;
    }> = [];

    // Evaluate initial positions
    for (const particle of particles) {
      const result = await evaluateFunction(particle.position);
      particle.currentFitness = this.calculateFitness(result);
      particle.bestFitness = particle.currentFitness;
      particle.bestPosition = { ...particle.position };

      if (particle.currentFitness > this.globalBestFitness) {
        this.globalBestFitness = particle.currentFitness;
        this.globalBestPosition = { ...particle.position };
      }
    }

    // Main PSO loop
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      for (const particle of particles) {
        // Update velocity and position
        for (const param of strategy.parameters) {
          const r1 = Math.random();
          const r2 = Math.random();

          particle.velocity[param.name] = 
            this.inertia * particle.velocity[param.name] +
            this.cognitiveWeight * r1 * (particle.bestPosition[param.name] - particle.position[param.name]) +
            this.socialWeight * r2 * (this.globalBestPosition[param.name] - particle.position[param.name]);

          // Update position
          particle.position[param.name] += particle.velocity[param.name];

          // Clamp position to parameter bounds
          particle.position[param.name] = Math.max(
            param.min,
            Math.min(param.max, particle.position[param.name])
          );
        }

        // Evaluate new position
        const result = await evaluateFunction(particle.position);
        particle.currentFitness = this.calculateFitness(result);

        // Update personal best
        if (particle.currentFitness > particle.bestFitness) {
          particle.bestFitness = particle.currentFitness;
          particle.bestPosition = { ...particle.position };

          // Update global best
          if (particle.currentFitness > this.globalBestFitness) {
            this.globalBestFitness = particle.currentFitness;
            this.globalBestPosition = { ...particle.position };
          }
        }
      }

      convergenceHistory.push(this.globalBestFitness);
      particleHistory.push({
        iteration,
        particles: particles.map(p => ({
          position: { ...p.position },
          velocity: { ...p.velocity },
          fitness: p.currentFitness
        }))
      });
    }

    return {
      bestParameters: this.globalBestPosition,
      bestFitness: this.globalBestFitness,
      convergenceHistory,
      particleHistory
    };
  }

  private initializeParticles(strategy: Strategy): Particle[] {
    const particles: Particle[] = [];

    for (let i = 0; i < this.particleCount; i++) {
      const position: Record<string, number> = {};
      const velocity: Record<string, number> = {};

      for (const param of strategy.parameters) {
        position[param.name] = param.min + Math.random() * (param.max - param.min);
        velocity[param.name] = (param.max - param.min) * (Math.random() - 0.5) * 0.1;
      }

      particles.push({
        position,
        velocity,
        bestPosition: { ...position },
        bestFitness: -Infinity,
        currentFitness: -Infinity
      });
    }

    return particles;
  }

  private calculateFitness(result: BacktestResult): number {
    return (
      result.winRate * 0.3 +
      (1 - result.maxDrawdown) * 0.3 +
      result.profitFactor * 0.4
    );
  }
}