import type { PublicUser } from "./user.interface.js";
import type { UserDocument } from "./user.model.js";

export const createPublicUser = (
  user: UserDocument,
): PublicUser => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};