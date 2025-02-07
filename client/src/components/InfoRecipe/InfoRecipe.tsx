import { FC, useEffect, useState } from "react";
import { recipe } from "../../types/TRecipe";
import classes from "./InfoRecipe.module.css";
import IconsIngredientBlock from "./IconsIngredientBlock/IconsIngredientBlock";
import { Link } from "react-router-dom";
import Heart from "../Heart";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axiosClient from "../../http/axios-client";
import Loader from "../Loader/Loader";
import { selectUser } from "../../redux/slices/userSlice";

type InfoRecipeProps = {
  recipe: recipe;
};

const InfoRecipe: FC<InfoRecipeProps> = ({ recipe }) => {
  const { user } = useSelector(selectUser);
  const [liked, setLiked] = useState(recipe?.likedUserIds?.includes(user.id));
  const [likeCount, setLikeCount] = useState(recipe?.likeCount);

  const handleLikeRecipe = () => {
    const data = {
      userId: user.id,
      recipeId: recipe.id,
    };
    axiosClient.post("/like", data);
    setLiked(!liked);

    setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));
  };

  useEffect(() => {
    if (recipe?.likedUserIds && user) {
      setLiked(recipe.likedUserIds.includes(user.id));
    }
  }, [recipe?.likedUserIds, user]);

  return (
    <div className={classes.infoFood}>
      <div className={classes.imageBlock}>
        <div className={classes.image}>
          <Heart onClick={handleLikeRecipe} recipe={recipe} likeCount={likeCount} liked={liked} />
          <img src={`data:image/png;base64,${recipe.recipeImage}`} alt="recipe image" />
        </div>
        <div className={classes.author}>
          <div className={classes.avatarAuthor}>
            <img src={`data:image/png;base64,${recipe.image}`} alt="" />
          </div>
          <div className={classes.infoAuthor}>
            <Link to={`/profile/${recipe.user_id}`}>{recipe.name}</Link>
          </div>
        </div>
      </div>
      <IconsIngredientBlock />
    </div>
  );
};

export default InfoRecipe;
