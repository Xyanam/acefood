import { FC, useEffect, useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import axiosClient from "../../http/axios-client";
import classes from "./AddRecipePage.module.css";
import deleteIcon from "../../assets/img/delete.svg";
import PinkButton from "../../components/ui/PinkButton/PinkButton";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../redux/store";
import { addNewRecipe } from "../../redux/slices/recipeSlice";
import { INewRecipeData } from "../../types/INewRecipe";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/slices/userSlice";
import { cn } from "@/lib/utils";

type TSelectOptions = {
  label: string;
  value: number;
};

type ingredientRecipeData = {
  ingredient_id: number;
  amount: string;
  measure: number;
};

const stylesSelect = {
  control: (base: CSSObjectWithLabel) => ({
    ...base,
    width: "200px",
    "&:hover": { borderColor: "gray" },
    border: "1px solid lightgray",
    boxShadow: "none",
    borderRadius: "10px",
  }),
};

const AddRecipePage: FC = () => {
  const { user } = useSelector(selectUser);
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuth) {
      navigate("/");
      toast.warning("Чтобы добавить рецепт вам нужно авторизоваться", {
        style: {
          fontSize: "18px",
          width: "400px",
        },
      });
    }
  }, [isAuth]);

  // Options select
  const [optionsCategory, setOptionsCategory] = useState<TSelectOptions[]>([]);
  const [optionsKitchen, setOptionsKitchen] = useState<TSelectOptions[]>([]);
  const [selectIngredientsOptions, setSelectIngredientsOptions] = useState<TSelectOptions[]>([]);
  const [selectMeasuresOptions, setSelectMeasuresOptions] = useState<TSelectOptions[]>([]);

  // Value select
  const [categoryValue, setCategoryValue] = useState<number>(0);
  const [kitchenValue, setKitchenValue] = useState<number>(0);
  const [selectCountIngredients, setSelectCountIngredients] = useState(2);
  const [selectIngredients, setSelectIngredients] = useState(
    Array(selectCountIngredients).fill(null)
  );
  const [selectMeasure, setSelectMeasure] = useState(Array(selectCountIngredients).fill(null));

  // Inputs value
  const [searchIngredient, setSearchIngredient] = useState("");
  const [amountValue, setAmountValue] = useState<string[]>([]);
  const [titleRecipe, setTitleRecipe] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [cookingMethodCount, setCookingMethodCount] = useState(2);
  const [cookingMethod, setCookingMethod] = useState<string[]>(Array(cookingMethodCount).fill(""));
  const [portion, setPortion] = useState(1);
  const [image, setImage] = useState("");
  const [weight, setWeight] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const list = [...amountValue];
    list[index] = value;
    setAmountValue(list);
  };

  const handleCookingMethodChange = (value: any, index: number) => {
    const values = [...cookingMethod];
    values[index] = value;
    setCookingMethod(values);
  };

  const handleAddCookingMethod = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCookingMethod([...cookingMethod, ""]);
    setCookingMethodCount((prev) => (prev += 1));
  };

  const handleRemoveCookingMethod = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    const values = [...cookingMethod];
    values.splice(idx, 1);
    setCookingMethod(values);
    setCookingMethodCount((prev) => (prev -= 1));
  };

  const selectIngredientsChange = (index: number) => (value: TSelectOptions) => {
    const newValues = [...selectIngredients];
    newValues[index] = value;
    setSelectIngredients(newValues);
  };

  const selectMeasureChange = (index: number) => (value: TSelectOptions) => {
    const newValues = [...selectMeasure];
    newValues[index] = value;
    setSelectMeasure(newValues);
  };

  const handleAddIngredient = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectIngredients([...selectIngredients, null]);
    setSelectCountIngredients(selectCountIngredients + 1);
  };

  const handleRemoveIngredient = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const ingredients = [...selectIngredients];
    ingredients.splice(index, 1);
    setSelectIngredients(ingredients);
    setSelectCountIngredients(selectCountIngredients - 1);
  };

  const decrementPortion = () => {
    if (portion > 1) {
      setPortion((prev) => prev - 1);
    }
  };

  const incrementPortion = () => {
    if (portion < 12) {
      setPortion((prev) => prev + 1);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleAddNewRecipe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!titleRecipe.trim()) {
      toast.error("Введите название рецепта.");
      return;
    }
    if (!kitchenValue || !categoryValue) {
      toast.error("Выберите кухню и категорию");
      return;
    }
    if (!cookingTime) {
      toast.error("Введите время приготовления");
      return;
    }
    if (selectIngredients.length < 2) {
      toast.error("Добавьте хотя бы один ингредиент.");
      return;
    }
    const nonNullIngredients = selectIngredients.filter((ingredient) => ingredient !== null);
    if (nonNullIngredients.length < 2) {
      toast.error("Добавьте хотя бы два ингредиента.");
      return;
    }
    const nonNullMeasure = selectMeasure.filter((ingredient) => ingredient !== null);
    if (nonNullMeasure.length < 2) {
      toast.error("Укажите единицы измерения");
      return;
    }
    if (!weight) {
      toast.error("Укажите вес готового блюда");
      return;
    }
    const validMethods = cookingMethod.filter((method) => method.trim() !== "");
    if (validMethods.length < 2) {
      toast.error("Укажите как минимум два этапа метода приготовления.");
      return;
    }
    if (!image) {
      toast.error("Добавьте изображение рецепта");
      return;
    }

    const formData = new FormData();

    const ingredients: ingredientRecipeData[] = selectIngredients.map((ingredient, index) => ({
      ingredient_id: ingredient.value,
      amount: amountValue[index],
      measure: selectMeasure[index].value,
    }));

    const cookingSteps = cookingMethod.map((cook, idx) => `${idx + 1}. ${cook}`).join("\n \n");

    formData.append("recipeName", titleRecipe);
    formData.append("kitchen", kitchenValue.toString());
    formData.append("category", categoryValue.toString());
    formData.append("user_id", user.id);
    formData.append("cookingTime", cookingTime);
    formData.append("cookingMethod", cookingSteps);
    formData.append("portion", portion.toString());
    formData.append("rating", "0");
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("recipePicture", image);
    formData.append("weight", weight);

    const recipeData: INewRecipeData = {
      recipeName: formData.get("recipeName") as string,
      kitchen: formData.get("kitchen") as string,
      category: formData.get("category") as string,
      user_id: formData.get("user_id") as string,
      cookingTime: formData.get("cookingTime") as string,
      cookingMethod: formData.get("cookingMethod") as string,
      portion: formData.get("portion") as string,
      rating: formData.get("rating") as string,
      ingredients: formData.get("ingredients") as string,
      recipePicture: formData.get("recipePicture") as File,
      weight: formData.get("weight") as string,
    };

    toast
      .promise(
        dispatch(addNewRecipe(recipeData)),
        {
          pending: "Загрузка...",
          success:
            "Спасибо что поделились рецептом! Сейчас он находится в обработке, как только его одобрят, вам придет оповещение",
          error: "Ошибка добавления рецепта",
        },
        {
          autoClose: 10000,
          closeOnClick: true,
          style: {
            width: 450,
            height: 90,
            right: 50,
            textAlign: "center",
          },
        }
      )
      .then(() => {
        setCookingMethodCount(2);
        setSelectCountIngredients(2);
        setCookingMethod(["", ""]);
        setSearchIngredient("");
        setAmountValue([]);
        setKitchenValue(0);
        setSelectIngredients([null, null]);
        setSelectMeasure([null, null]);
        setCategoryValue(0);
        setTitleRecipe("");
        setCookingTime("");
        setPortion(1);
        setImage("");
        setWeight("");
        setPreviewImage(null);
      });
  };

  useEffect(() => {
    axiosClient
      .get<TSelectOptions[]>("/category")
      .then((response) => setOptionsCategory((prev) => [...prev, ...response.data]));
    axiosClient
      .get<TSelectOptions[]>("/kitchen")
      .then((resp) => setOptionsKitchen((prev) => [...prev, ...resp.data]));
    axiosClient
      .get<TSelectOptions[]>("/measure")
      .then((response) => setSelectMeasuresOptions(response.data));
  }, []);

  useEffect(() => {
    axiosClient.get(`/ingredients?title=${searchIngredient}`).then((response) => {
      setSelectIngredientsOptions(response.data);
    });
  }, [searchIngredient]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.title}>
        <h1>
          Поделитесь вашим
          <br /> любимым рецептом
        </h1>
      </div>
      <div className={classes.container}>
        <form
          className={cn(classes.form, "mt-10")}
          encType="multipart/form-data"
          onSubmit={(e) => handleAddNewRecipe(e)}>
          <div className={classes.formItem}>
            <p>1. Введите название блюда</p>
            <input
              type="text"
              placeholder="Название блюда"
              className={classes.input}
              value={titleRecipe}
              onChange={(e) => setTitleRecipe(e.target.value)}
            />
          </div>
          <div className={classes.formItem}>
            <p>2. Выберите кухню и категорию</p>
            <div className={classes.formSelect}>
              <Select
                styles={stylesSelect}
                placeholder="Кухня"
                options={optionsKitchen}
                onChange={(e) => {
                  e !== null && setKitchenValue(e.value);
                }}
              />
              <Select
                styles={stylesSelect}
                placeholder="Категория"
                options={optionsCategory}
                onChange={(e) => {
                  e !== null && setCategoryValue(e.value);
                }}
              />
            </div>
          </div>
          <div className={classes.formItem}>
            <p>
              3. Укажите время на приготовление
              <br /> вашего блюда <br /> (в минутах)
            </p>
            <input
              type="number"
              placeholder="Минут(А)(Ы)"
              value={cookingTime}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 0) {
                  setCookingTime(value);
                }
              }}
              className={classes.input}
              min={0}
            />
          </div>
          <div className={classes.formItem}>
            <p className="mb-2">4. Выберите ингредиенты</p>
            <>
              {selectIngredients.map((_, index) => (
                <div className={classes.ingredientsSelect} key={index}>
                  <Select
                    styles={stylesSelect}
                    value={selectIngredients[index]}
                    onChange={selectIngredientsChange(index)}
                    options={selectIngredientsOptions}
                    onInputChange={(e) => setSearchIngredient(e)}
                    placeholder="Ингредиент"
                    noOptionsMessage={({ inputValue }) =>
                      !inputValue ? "Не найдено" : "Не найдено"
                    }
                  />
                  {selectMeasure[index]?.label !== "По вкусу" ? (
                    <input
                      type="number"
                      className={classes.ingredientInput}
                      min={0}
                      onChange={(e) => {
                        handleInputChange(e, index);
                      }}
                    />
                  ) : (
                    <div className="w-16"></div>
                  )}
                  <Select
                    styles={stylesSelect}
                    value={selectMeasure[index]}
                    onChange={selectMeasureChange(index)}
                    options={selectMeasuresOptions}
                    placeholder="Ед. изм."
                  />
                  {selectCountIngredients > 2 && (
                    <div
                      className={classes.deleteIcon}
                      onClick={(e) => handleRemoveIngredient(e, index)}>
                      <img src={deleteIcon} alt="delete" />
                    </div>
                  )}
                </div>
              ))}
            </>
            <button onClick={handleAddIngredient} className={classes.addIngredient}>
              Добавить ингредиент
            </button>
          </div>
          <div className={classes.calculatePortion}>
            <p style={{ fontSize: "16px", marginRight: "10px" }}>Порции</p>
            <div className={classes.calculate} onClick={decrementPortion}>
              -
            </div>
            <div className={classes.portion}>{portion}</div>
            <div className={classes.calculate} onClick={incrementPortion}>
              +
            </div>
          </div>
          <div className={classes.formItem}>
            <p>
              5. Вес готового блюда <br /> (в граммах)
            </p>
            <input
              className={classes.input}
              placeholder="Укажите вес в граммах"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className={classes.formItem}>
            <p>
              6. Опишите пошагово
              <br /> способ приготовления
            </p>
            <div className={classes.cookingMethodArea}>
              {cookingMethod.map((_, idx) => (
                <div className={classes.textAreaCooking} key={idx}>
                  <span className={classes.cookingMethodStep}>{idx + 1}</span>
                  <textarea
                    className={cn(classes.cookingMethod, "font-comforta")}
                    value={cookingMethod[idx]}
                    onChange={(e) => handleCookingMethodChange(e.target.value, idx)}
                    placeholder={`Описание ${idx + 1} этапа`}
                  />
                  {cookingMethodCount > 2 && idx + 1 === cookingMethod.length && (
                    <div
                      className={classes.deleteIcon}
                      onClick={(e) => handleRemoveCookingMethod(e, idx)}>
                      <img src={deleteIcon} alt="delete" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleAddCookingMethod} className={classes.addIngredient}>
              Добавить этап
            </button>
          </div>
          <div className={classes.formItem}>
            <input
              type="file"
              onChange={(e: any) => {
                setImage(e.target.files[0]);
                handleImageChange(e);
              }}
              className={classes.imageInput}
              accept="image/*"
            />
            {previewImage && (
              <img src={previewImage} alt="Preview" className={classes.previewImage} />
            )}
          </div>
          <div className={classes.formItem}>
            <PinkButton fontSize="16px" width="300px">
              Отправить на модерацию
            </PinkButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipePage;
