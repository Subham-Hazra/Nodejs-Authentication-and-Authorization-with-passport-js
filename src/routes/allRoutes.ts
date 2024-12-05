import authRoutes from "./authRoutes";
import protectedRoutes from "./protectedRoutes";
import { AppRouter } from "./router";

const router = new AppRouter().routerInstance;
router.use(authRoutes);
router.use(protectedRoutes);

export default router;