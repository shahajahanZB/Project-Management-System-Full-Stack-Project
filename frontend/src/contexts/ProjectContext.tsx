import React, { createContext, useContext } from "react";

type ProjectContextType = {
  projectId: string | null;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  return (
    <ProjectContext.Provider value={{ projectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
