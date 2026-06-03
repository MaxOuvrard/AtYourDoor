import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./exceptions.js";

/**
 * Gestionnaire d'erreurs centralisé — format RFC 7807 Problem Details.
 * À enregistrer via server.setErrorHandler(buildErrorHandler()).
 */
export function buildErrorHandler() {
  return function errorHandler(
    error: FastifyError | Error,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    request.log.error({ err: error, url: request.url, method: request.method });

    // Erreurs métier → RFC 7807 avec le statusCode approprié
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        ...error.problemDetail,
        instance: request.url,
      });
    }

    // Erreurs de validation TypeBox/Fastify → 400
    const fastifyError = error as FastifyError;
    if (fastifyError.code === "FST_ERR_VALIDATION") {
      return reply.status(400).send({
        type: "urn:app:error:validation",
        title: "Validation Error",
        status: 400,
        detail: fastifyError.message,
        instance: request.url,
      });
    }

    // Fallback → 500
    reply.status(500).send({
      type: "urn:app:error:internal",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred",
      instance: request.url,
    });
  };
}
