export default interface User {
  email: string;
  displayName: string;
  isActive: boolean;
  prompts: Array<{ prompt: string; timestamp: string }>;
  rejectedPrompts: Array<{ prompt: string; timestamp: string }>;
  strikeCount: number;
  lastPromptAt?: Date;
  lastRejectedPromptAt?: Date;
}
