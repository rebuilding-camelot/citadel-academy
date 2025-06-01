// File: tests/setup.ts
// Global test setup for Vitest

// Define types for our mock function
interface MockResult {
  type: 'return' | 'throw';
  value: any;
}

interface MockFn {
  (...args: any[]): any;
  mock: {
    calls: any[][];
    results: MockResult[];
    instances: any[];
    contexts: any[];
    lastCall: any[] | undefined;
    implementation?: (...args: any[]) => any;
  };
  mockImplementation: (implementation: (...args: any[]) => any) => MockFn;
  mockReturnValue: (value: any) => MockFn;
  mockResolvedValue: (value: any) => MockFn;
  mockRejectedValue: (value: any) => MockFn;
}

// Set up global mocks
global.jest = {
  fn: (): MockFn => {
    const mockFn = ((...args: any[]) => {
      mockFn.mock.calls.push(args);
      return mockFn.mock.implementation ? 
        mockFn.mock.implementation(...args) : 
        mockFn.mock.results[mockFn.mock.calls.length - 1]?.value;
    }) as MockFn;
    
    mockFn.mock = {
      calls: [] as any[][],
      results: [] as MockResult[],
      instances: [] as any[],
      contexts: [] as any[],
      lastCall: undefined
    };
    
    mockFn.mockImplementation = (implementation: (...args: any[]) => any) => {
      mockFn.mock.implementation = implementation;
      return mockFn;
    };
    
    mockFn.mockReturnValue = (value: any) => {
      mockFn.mock.implementation = () => value;
      return mockFn;
    };
    
    mockFn.mockResolvedValue = (value: any) => {
      mockFn.mock.implementation = () => Promise.resolve(value);
      return mockFn;
    };
    
    mockFn.mockRejectedValue = (value: any) => {
      mockFn.mock.implementation = () => Promise.reject(value);
      return mockFn;
    };
    
    return mockFn;
  }
};

// Add any other global setup needed for tests