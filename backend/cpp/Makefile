CXX = g++
CXXFLAGS = -std=c++17 -fPIC -Wall -Wextra
LDFLAGS = -shared

SRCDIR = src
OBJDIR = obj
LIBDIR = lib

SOURCES = $(wildcard $(SRCDIR)/**/*.cpp)
OBJECTS = $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

TARGET = $(LIBDIR)/libstrategy.so

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJECTS)
	@mkdir -p $(LIBDIR)
	$(CXX) $(LDFLAGS) -o $@ $^

$(OBJDIR)/%.o: $(SRCDIR)/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -rf $(OBJDIR) $(LIBDIR)