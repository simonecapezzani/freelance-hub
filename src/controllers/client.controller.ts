import type { NextFunction, Request, Response } from 'express';
import { toClientResponse } from '../mappers/client.mapper.ts';
import * as clientService from '../services/client.service.ts';
import { getRouteId, getUserId } from '../utils/http.utils.ts';

/**
 * Lists all clients for the authenticated user.
 */
export async function listClients(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clients = await clientService.listClients(getUserId(req));
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
    const client = await clientService.createClient(getUserId(req), req.body);
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
    const client = await clientService.getClient(
      getUserId(req),
      getRouteId(req.params.id),
    );
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
    const client = await clientService.updateClient(
      getUserId(req),
      getRouteId(req.params.id),
      req.body,
    );
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
    await clientService.deleteClient(
      getUserId(req),
      getRouteId(req.params.id),
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
