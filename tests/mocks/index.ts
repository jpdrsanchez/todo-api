import Task from 'App/Models/Task'

export const generateTasks = (lenght = 10): Partial<Task>[] => {
  return Array.from({ length: lenght })
    .fill('1')
    .map((_, index) => ({
      title: `Task ${index + 1}`,
      order: index + 1,
    }))
}
