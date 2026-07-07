/**
 * controllers/user.controller.js
 * --------------------------------
 * Handles HTTP request/response for user management endpoints.
 */

import * as userService from "../services/user.service.js";
import { ok } from "../utils/response.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    ok(res, "Profile fetched successfully.", user);
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    ok(res, "Profile updated successfully.", user);
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const user = await userService.updateAvatar(req.user.id, req.file);
    ok(res, "Avatar updated successfully.", user);
  } catch (err) {
    next(err);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await userService.getAllStaff();
    ok(res, "Staff list fetched successfully.", staff);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    ok(res, "User fetched successfully.", user);
  } catch (err) {
    next(err);
  }
};
