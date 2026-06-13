import { config } from "@/config";
import { UserServiceImpl } from "./user.service";

export const userService = new UserServiceImpl(config.apiUrl);
