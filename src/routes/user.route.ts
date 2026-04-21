import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginAsync,
} from "fastify";
import UserController from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";

const userRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) => {
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: verifyToken,
      schema: {
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    },
    UserController.getUser,
  );
  fastify.post("/", UserController.createUser);
};

export default userRoutes;
