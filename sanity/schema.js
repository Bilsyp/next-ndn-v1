import { blockContent } from "./schemaTypes/blockContent";
import { category } from "./schemaTypes/category";
import { post } from "./schemaTypes/post";
import { author } from "./schemaTypes/author";
import blog from "./schemaTypes/blog";

export const schema = {
  types: [post, author, category, blockContent, blog],
};
