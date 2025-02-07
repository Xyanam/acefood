import axiosClient from "../http/axios-client";
import { IComments } from "../types/IComments";

export type CommentRecipeData = {
  user_id: string;
  recipe_id: string | undefined;
  text: string;
};

export default class CommentService {
  static async getCommentsByRecipe(recipeID: string) {
    return axiosClient
      .get<IComments[]>(`/recipes/${recipeID}/comments`)
      .then((response) => response.data);
  }
  static async addCommentsByRecipe(data: CommentRecipeData) {
    return axiosClient
      .post(`/recipes/${data.recipe_id}/comments`, data)
      .then((response) => response.data);
  }
  static async deleteCommentById(id: number) {
    return axiosClient
      .post(`/recipes/deleteComment`, { comment_id: id })
      .then((response) => response.data);
  }
  static async updateCommentById(data: { comment_id: string; text: string }) {
    return axiosClient.post("/recipes/updateComment", {
      comment_id: data.comment_id,
      text: data.text,
    });
  }
}
