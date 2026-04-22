import { and, eq, ne } from 'drizzle-orm';
import { db } from '../config/db';
import { labelsTable } from '../db';
import { ApiError } from '../utils/api-response';
import type {
  CreateLabelType,
  UpdateLabelType,
} from '../validations/labels.validation';

export class LabelService {
  static async createLabel(workspaceId: string, data: CreateLabelType) {
    const { name, color } = data;

    const [existing] = await db
      .select({ id: labelsTable.id })
      .from(labelsTable)
      .where(
        and(
          eq(labelsTable.name, name),
          eq(labelsTable.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (existing)
      throw new ApiError(
        409,
        `Label with name '${name}' already exists in the workspace`
      );

    const [label] = await db
      .insert(labelsTable)
      .values({
        workspaceId,
        name,
        color,
      })
      .returning();

    if (!label)
      throw new ApiError(500, 'Error creating label. Please try again.');

    return label;
  }

  static async listLabels(workspaceId: string) {
    const labels = await db
      .select({
        id: labelsTable.id,
        workspaceId: labelsTable.workspaceId,
        name: labelsTable.name,
        color: labelsTable.color,
      })
      .from(labelsTable)
      .where(eq(labelsTable.workspaceId, workspaceId));

    return labels;
  }

  static async updateLabel(
    workspaceId: string,
    labelId: string,
    data: UpdateLabelType
  ) {
    const { name, color } = data;

    if (name) {
      const [sameName] = await db
        .select({ id: labelsTable.id })
        .from(labelsTable)
        .where(
          and(
            eq(labelsTable.name, name),
            eq(labelsTable.workspaceId, workspaceId),
            ne(labelsTable.id, labelId)
          )
        )
        .limit(1);

      if (sameName)
        throw new ApiError(
          409,
          `Label with name '${name}' already exists in the workspace`
        );
    }

    const [updatedLabel] = await db
      .update(labelsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
      })
      .where(eq(labelsTable.id, labelId))
      .returning();

    if (!updatedLabel)
      throw new ApiError(500, 'Error updating label. Please try again.');

    return updatedLabel;
  }

  static async deleteLabel(labelId: string) {
    const [deletedlabel] = await db
      .delete(labelsTable)
      .where(eq(labelsTable.id, labelId))
      .returning();

    if (!deletedlabel)
      throw new ApiError(500, 'Error deleting label. Please try again.');

    return deletedlabel;
  }
}
