import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import sizesRouter from "./sizes";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import bannersRouter from "./banners";
import galleryRouter from "./gallery";
import settingsRouter from "./settings";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(sizesRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(bannersRouter);
router.use(galleryRouter);
router.use(settingsRouter);
router.use(adminRouter);

export default router;
