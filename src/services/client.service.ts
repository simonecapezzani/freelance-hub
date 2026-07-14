import { Client, type IClientDocument, type IProject } from '../models/client.model.ts';
import type { Project } from '../types/index.ts';
import { createHttpError } from '../utils/http.utils.ts';
import {
  validateCreateClientPayload,
  validateUpdateClientPayload,
  type ValidatedUpdateClientPayload,
} from '../utils/validation/client.validator.ts';

/**
 * Maps API project input to embedded project documents.
 * @param projects - Validated project payloads
 * @returns Embedded project documents
 */
function mapProjects(projects: Project[]): IProject[] {
  return projects.map((project) => ({
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt ?? new Date(),
  }));
}

/**
 * Returns a client owned by a user or throws a 404 error.
 * @param clientId - Client id
 * @param userId - Authenticated user id
 * @returns Owned client document
 */
export async function findOwnedClient(
  clientId: string,
  userId: string,
): Promise<IClientDocument> {
  const client = await Client.findOne({ _id: clientId, userId });

  if (!client) {
    throw createHttpError('Client not found', 404);
  }

  return client;
}

/**
 * Asserts that a project belongs to a client.
 * @param client - Client document
 * @param projectId - Embedded project id
 */
export function assertProjectOnClient(
  client: IClientDocument,
  projectId: string,
): void {
  const projectExists = client.projects.some(
    (project) => project._id?.toString() === projectId,
  );

  if (!projectExists) {
    throw createHttpError('Project not found on client', 400);
  }
}

/**
 * Applies a validated client patch to a document.
 * @param client - Client document
 * @param patch - Validated update payload
 */
function applyClientPatch(
  client: IClientDocument,
  patch: ValidatedUpdateClientPayload,
): void {
  if (Object.prototype.hasOwnProperty.call(patch, 'name')) {
    client.name = patch.name as string;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'email')) {
    client.email = patch.email;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'company')) {
    client.company = patch.company;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'notes')) {
    client.notes = patch.notes;
  }

  if (patch.teamMembers !== undefined) {
    client.teamMembers = patch.teamMembers;
  }

  if (patch.projects !== undefined) {
    client.projects = mapProjects(patch.projects);
  }
}

/**
 * Lists clients owned by a user.
 * @param userId - Authenticated user id
 * @returns Owned client documents
 */
export async function listClients(userId: string): Promise<IClientDocument[]> {
  return Client.find({ userId }).sort({ createdAt: -1 });
}

/**
 * Creates a client for a user.
 * @param userId - Authenticated user id
 * @param body - Raw request body
 * @returns Created client document
 */
export async function createClient(
  userId: string,
  body: unknown,
): Promise<IClientDocument> {
  const payload = validateCreateClientPayload(body);

  return Client.create({
    userId,
    ...payload,
    projects: mapProjects(payload.projects),
  });
}

/**
 * Gets a client owned by a user.
 * @param userId - Authenticated user id
 * @param clientId - Client id
 * @returns Owned client document
 */
export async function getClient(
  userId: string,
  clientId: string,
): Promise<IClientDocument> {
  return findOwnedClient(clientId, userId);
}

/**
 * Updates a client owned by a user.
 * @param userId - Authenticated user id
 * @param clientId - Client id
 * @param body - Raw request body
 * @returns Updated client document
 */
export async function updateClient(
  userId: string,
  clientId: string,
  body: unknown,
): Promise<IClientDocument> {
  const client = await findOwnedClient(clientId, userId);
  const patch = validateUpdateClientPayload(body);

  applyClientPatch(client, patch);
  await client.save();
  return client;
}

/**
 * Deletes a client owned by a user.
 * @param userId - Authenticated user id
 * @param clientId - Client id
 */
export async function deleteClient(
  userId: string,
  clientId: string,
): Promise<void> {
  const client = await findOwnedClient(clientId, userId);
  await client.deleteOne();
}
