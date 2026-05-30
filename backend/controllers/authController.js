import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTokenResponse, generateAccessToken } from "../utils/tokens.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });

  if (exists) {
    res.status(409);
    throw new Error("Email deja utilise");
  }

  const user = await User.create({ name, email, password, role });
  await sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Email ou mot de passe incorrect");
  }

  await sendTokenResponse(user, 200, res);
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token requis");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error("Refresh token invalide");
  }

  res.json({ accessToken: generateAccessToken(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { $unset: { refreshToken: "" } });
  }

  res.json({ message: "Deconnexion reussie" });
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});
