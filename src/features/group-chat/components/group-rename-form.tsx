"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { GROUP_NAME_MAX_LENGTH } from "@/domains/group/group.schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
  renameGroupSchema,
  type RenameGroupFormValues,
} from "../schemas/create-group.schema";

type GroupRenameFormProps = {
  currentName: string;
  isPending: boolean;
  onRename: (name: string) => void;
};

/** Admin-only rename. React Hook Form + Zod, per the project's form rule. */
export function GroupRenameForm({
  currentName,
  isPending,
  onRename,
}: GroupRenameFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RenameGroupFormValues>({
    resolver: zodResolver(renameGroupSchema),
    defaultValues: { name: currentName },
    mode: "onBlur",
  });

  // `useWatch` rather than `watch()`: the latter returns a fresh function on
  // every render, which React Compiler cannot memoize safely and therefore
  // bails out on for the whole component.
  const name = useWatch({ control, name: "name" });

  // No point offering "Save" for the name it already has.
  const isUnchanged = (name ?? "").trim() === currentName.trim();

  return (
    <form
      onSubmit={handleSubmit((values) => onRename(values.name.trim()))}
      className="flex items-end gap-2"
    >
      <div className="flex-1">
        <Input
          label="Group name"
          maxLength={GROUP_NAME_MAX_LENGTH}
          error={errors.name?.message}
          {...register("name")}
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isUnchanged}
        isLoading={isPending}
      >
        Save
      </Button>
    </form>
  );
}
