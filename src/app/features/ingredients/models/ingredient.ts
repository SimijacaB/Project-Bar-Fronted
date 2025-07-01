import { UnitOfMeasure } from "../../../shared/enums/unit-of-measure";

export interface Ingredient {
    id: number,
    code: string,
    name: string,
    unitOfMeasure: UnitOfMeasure
}
