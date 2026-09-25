"use client";

import * as React from "react";
import { useFormContext, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  className,
}: {
  name: FieldPath<T>;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} placeholder={placeholder} {...register(name)} />
      <FormError message={error} />
    </div>
  );
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  className,
}: {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} placeholder={placeholder} {...register(name)} />
      <FormError message={error} />
    </div>
  );
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Select...",
  className,
}: {
  name: FieldPath<T>;
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        {...register(name)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FormError message={error} />
    </div>
  );
}

export function FormDatePicker<T extends FieldValues>({
  name,
  label,
  className,
}: {
  name: FieldPath<T>;
  label: string;
  className?: string;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={name}
            type="date"
            value={field.value ?? ""}
            onChange={field.onChange}
          />
        )}
      />
      <FormError message={error} />
    </div>
  );
}

export function SubmitButton({
  children,
  loading,
  className,
}: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
        className,
      )}
    >
      {loading ? "Saving..." : children}
    </button>
  );
}
