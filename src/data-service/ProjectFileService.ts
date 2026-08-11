import type { CollageState } from "../models";

export interface ProjectFileService {
  saveProject(state: CollageState): Promise<void>;
  openProject(file: File): Promise<CollageState>;
}
