// backend/utils/queryHelper.js

export const buildQueryOptions = (req) => {
  const search = req.query.search || "";
  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order === "desc" ? -1 : 1;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const skip = (page - 1) * limit;

  const regex = new RegExp(search, "i");

  return { search, sortBy, order, page, limit, skip, regex };
};
