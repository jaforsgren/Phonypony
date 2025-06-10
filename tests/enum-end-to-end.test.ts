import { parseTypeScriptDefinitions } from '../src/lib/typescript-parser';
import { generateAndSaveMockData } from '../src/lib/mock-data-service';

describe('Enum End-to-End Tests', () => {
  it('should parse and generate mock data with string enums', async () => {
    const source = `
      enum Status {
        ACTIVE = "active",
        INACTIVE = "inactive",
        PENDING = "pending"
      }
      
      interface Task {
        id: number;
        title: string;
        status: Status;
      }
    `;
    
    const mockData = await generateAndSaveMockData(source, { count: 5, numberMax: 100, seed: 12345 });
    
    expect(mockData).toHaveLength(1);
    expect(mockData[0].name).toBe('Task');
    expect(mockData[0].data).toHaveLength(5);
    
    mockData[0].data.forEach((item: any) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('status');
      expect(typeof item.id).toBe('number');
      expect(typeof item.title).toBe('string');
      expect(['active', 'inactive', 'pending']).toContain(item.status);
    });
  });

  it('should parse and generate mock data with numeric enums', async () => {
    const source = `
      enum Priority {
        LOW = 1,
        MEDIUM = 2,
        HIGH = 3
      }
      
      interface Task {
        name: string;
        priority: Priority;
      }
    `;
    
    const mockData = await generateAndSaveMockData(source, { count: 3, numberMax: 100, seed: 54321 });
    
    expect(mockData).toHaveLength(1);
    expect(mockData[0].name).toBe('Task');
    expect(mockData[0].data).toHaveLength(3);
    
    mockData[0].data.forEach((item: any) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('priority');
      expect(typeof item.name).toBe('string');
      expect([1, 2, 3]).toContain(item.priority);
    });
  });

  it('should parse and generate mock data with auto-incrementing enums', async () => {
    const source = `
      enum Direction {
        Up,
        Down,
        Left,
        Right
      }
      
      interface Movement {
        direction: Direction;
        distance: number;
      }
    `;
    
    const mockData = await generateAndSaveMockData(source, { count: 4, numberMax: 100, seed: 99999 });
    
    expect(mockData).toHaveLength(1);
    expect(mockData[0].name).toBe('Movement');
    expect(mockData[0].data).toHaveLength(4);
    
    mockData[0].data.forEach((item: any) => {
      expect(item).toHaveProperty('direction');
      expect(item).toHaveProperty('distance');
      expect([0, 1, 2, 3]).toContain(item.direction);
      expect(typeof item.distance).toBe('number');
    });
  });

  it('should parse and generate complex data with multiple enums', async () => {
    const source = `
      enum TaskStatus {
        TODO = "todo",
        IN_PROGRESS = "in_progress",
        DONE = "done"
      }
      
      enum Priority {
        LOW = 1,
        MEDIUM = 2,
        HIGH = 3
      }
      
      interface Task {
        id: number;
        title: string;
        status: TaskStatus;
        priority: Priority;
        tags: string[];
      }
      
      interface Project {
        name: string;
        tasks: Task[];
        defaultStatus: TaskStatus;
      }
    `;
    
    const mockData = await generateAndSaveMockData(source, { count: 2, numberMax: 100, seed: 11111 });
    
    // Should have both Task and Project interfaces
    expect(mockData).toHaveLength(2);
    
    const taskData = mockData.find(m => m.name === 'Task');
    const projectData = mockData.find(m => m.name === 'Project');
    
    expect(taskData).toBeDefined();
    expect(projectData).toBeDefined();
    
    // Check Task data
    taskData!.data.forEach((task: any) => {
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('tags');
      expect(['todo', 'in_progress', 'done']).toContain(task.status);
      expect([1, 2, 3]).toContain(task.priority);
      expect(Array.isArray(task.tags)).toBe(true);
    });
    
    // Check Project data
    projectData!.data.forEach((project: any) => {
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('tasks');
      expect(project).toHaveProperty('defaultStatus');
      expect(typeof project.name).toBe('string');
      expect(Array.isArray(project.tasks)).toBe(true);
      expect(['todo', 'in_progress', 'done']).toContain(project.defaultStatus);
      
      // Check nested tasks
      project.tasks.forEach((task: any) => {
        expect(['todo', 'in_progress', 'done']).toContain(task.status);
        expect([1, 2, 3]).toContain(task.priority);
      });
    });
  });

  it('should handle enum arrays correctly', async () => {
    const source = `
      enum Color {
        RED = "red",
        GREEN = "green",
        BLUE = "blue"
      }
      
      interface Palette {
        name: string;
        colors: Color[];
        primaryColor: Color;
      }
    `;
    
    const mockData = await generateAndSaveMockData(source, { count: 3, numberMax: 100, seed: 77777 });
    
    expect(mockData).toHaveLength(1);
    expect(mockData[0].name).toBe('Palette');
    
    mockData[0].data.forEach((palette: any) => {
      expect(palette).toHaveProperty('name');
      expect(palette).toHaveProperty('colors');
      expect(palette).toHaveProperty('primaryColor');
      expect(typeof palette.name).toBe('string');
      expect(Array.isArray(palette.colors)).toBe(true);
      expect(['red', 'green', 'blue']).toContain(palette.primaryColor);
      
      palette.colors.forEach((color: any) => {
        expect(['red', 'green', 'blue']).toContain(color);
      });
    });
  });

  it('should generate deterministic enum values with same seed', async () => {
    const source = `
      enum Status {
        ACTIVE = "active",
        INACTIVE = "inactive"
      }
      
      interface User {
        name: string;
        status: Status;
      }
    `;
    
    const mockData1 = await generateAndSaveMockData(source, { count: 2, numberMax: 100, seed: 12345 });
    const mockData2 = await generateAndSaveMockData(source, { count: 2, numberMax: 100, seed: 12345 });
    
    expect(mockData1).toEqual(mockData2);
    
    // Ensure enum values are actually being used
    mockData1[0].data.forEach((item: any) => {
      expect(['active', 'inactive']).toContain(item.status);
    });
  });
});
