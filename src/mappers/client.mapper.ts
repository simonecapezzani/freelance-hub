import type { IClientDocument } from '../models/client.model.ts';

/**
 * Maps a client document to its public API representation.
 * @param client - Mongoose client document
 * @returns Serialized client
 */
export function toClientResponse(client: IClientDocument) {
  return {
    id: client._id.toString(),
    userId: client.userId.toString(),
    name: client.name,
    email: client.email,
    company: client.company,
    notes: client.notes,
    teamMembers: client.teamMembers,
    projects: client.projects.map((project) => ({
      id: project._id?.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
    })),
    createdAt: client.createdAt,
  };
}
