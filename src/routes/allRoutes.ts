import { AppRouter } from "routes";
import authRoutes from "./authRoutes";
import protectedRoutes from "./protectedRoutes";

const router:any = AppRouter.router;
// Use Authentication Routes
router.use(authRoutes);
//Use protected Routes
router.use(protectedRoutes); // Protected routes

export default router