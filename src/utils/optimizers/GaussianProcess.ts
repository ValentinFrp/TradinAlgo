export class GaussianProcess {
  private trainX: number[][] = [];
  private trainY: number[] = [];
  private kernel: (x1: number[], x2: number[]) => number;
  private noiseLevel: number;

  constructor(noiseLevel = 1e-6) {
    this.noiseLevel = noiseLevel;
    this.kernel = this.rbfKernel.bind(this);
  }

  fit(X: number[][], y: number[]): void {
    this.trainX = X;
    this.trainY = y;
  }

  predict(x: number[]): [number, number] {
    if (this.trainX.length === 0) {
      return [0, 1];
    }

    const k = this.trainX.map(xi => this.kernel(x, xi));
    const K = this.computeKernelMatrix();

    // Mean prediction
    const Kinv = this.inverseMatrix(K);
    const mean = k.reduce((sum, ki, i) => sum + ki * this.trainY[i], 0);

    // Variance prediction
    const variance = this.kernel(x, x) - 
      k.reduce((sum, ki, i) => 
        sum + ki * k.reduce((s, kj, j) => s + Kinv[i][j] * kj, 0), 0);

    return [mean, Math.sqrt(Math.max(variance, 0))];
  }

  private rbfKernel(x1: number[], x2: number[], lengthScale = 1.0): number {
    const squaredDistance = x1.reduce((sum, xi, i) => 
      sum + Math.pow(xi - x2[i], 2), 0);
    return Math.exp(-squaredDistance / (2 * lengthScale * lengthScale));
  }

  private computeKernelMatrix(): number[][] {
    const n = this.trainX.length;
    const K: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        const value = this.kernel(this.trainX[i], this.trainX[j]);
        K[i][j] = value;
        K[j][i] = value;
      }
      K[i][i] += this.noiseLevel;
    }

    return K;
  }

  private inverseMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    const augmented: number[][] = matrix.map((row, i) => 
      [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]
    );

    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = j;
        }
      }

      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      const pivot = augmented[i][i];
      for (let j = i; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const factor = augmented[j][i];
          for (let k = i; k < 2 * n; k++) {
            augmented[j][k] -= factor * augmented[i][k];
          }
        }
      }
    }

    return augmented.map(row => row.slice(n));
  }
}