import type { NextFunction, Request, Response } from 'express';
import { Client, type IClientDocument, type IProject } from '../models/client.model.ts';
import type { Project, TeamMember } from '../types/index.ts';
import {
  createHttpError,
  getRouteId,
  getUserId,
  isNonEmptyString,
} from '../utils/http.utils.ts';

interface CreateClientBody {
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
  teamMembers?: TeamMember[];
  projects?: Project[];
}

interface UpdateClientBody {
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
  teamMembers?: TeamMember[];
  projects?: Project[];
}

/**
 * Maps a client document to the API response shape.
 * @param client - Mongoose client document
 * @returns Serialized client
 */
function toClientResponse(client: IClientDocument) {
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

/**
 * Maps API project input to embedded project documents.
 * @param projects - Projects from request body
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
 * Returns a client owned by the authenticated user or throws 404.
 * @param clientId - Client id from route params
 * @param userId - Authenticated user id
 * @returns Client document
 */
async function findOwnedClient(
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
 * Lists all clients for the authenticated user.
 */
export async function listClients(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clients = await Client.find({ userId: getUserId(req) }).sort({ createdAt: -1 });
    res.json(clients.map(toClientResponse));
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new client for the authenticated user.
 */
export async function createClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, email, company, notes, teamMembers, projects } =
      req.body as CreateClientBody;

    if (!isNonEmptyString(name)) {
      throw createHttpError('Name is required', 400);
    }

    const client = await Client.create({
      userId: getUserId(req),
      name: name.trim(),
      email: isNonEmptyString(email) ? email.trim().toLowerCase() : undefined,
      company: isNonEmptyString(company) ? company.trim() : undefined,
      notes: isNonEmptyString(notes) ? notes.trim() : undefined,
      teamMembers: teamMembers ?? [],
      projects: projects ? mapProjects(projects) : [],
    });

    res.status(201).json(toClientResponse(client));
  } catch (error) {
    next(error);
  }
}

/**
 * Returns a single client with embedded team members and projects.
 */
export async function getClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const client = await findOwnedClient(getRouteId(req.params.id), getUserId(req));
    res.json(toClientResponse(client));
  } catch (error) {
    next(error);
  }
}

/**
 * Updates a client owned by the authenticated user.
 */
export async function updateClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, email, company, notes, teamMembers, projects } =
      req.body as UpdateClientBody;

    const client = await findOwnedClient(getRouteId(req.params.id), getUserId(req));

    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        throw createHttpError('Name cannot be empty', 400);
      }

      client.name = name.trim();
    }

    if (email !== undefined) {
      client.email = isNonEmptyString(email) ? email.trim().toLowerCase() : undefined;
    }

    if (company !== undefined) {
      client.company = isNonEmptyString(company) ? company.trim() : undefined;
    }

    if (notes !== undefined) {
      client.notes = isNonEmptyString(notes) ? notes.trim() : undefined;
    }

    if (teamMembers !== undefined) {
      client.teamMembers = teamMembers;
    }

    if (projects !== undefined) {
      client.projects = mapProjects(projects);
    }

    await client.save();
    res.json(toClientResponse(client));
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a client owned by the authenticated user.
 */
export async function deleteClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const client = await findOwnedClient(getRouteId(req.params.id), getUserId(req));
    await client.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
