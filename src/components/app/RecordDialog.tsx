import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadMedia } from "@/lib/api";
import { StoredImage } from "./primitives";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "switch"
  | "date"
  | "image";

export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2;
  help?: string;
};

export type Values = Record<string, unknown>;

export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
  submitLabel = "Save",
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: Field[];
  initial?: Values;
  onSubmit: (values: Values) => Promise<void>;
  submitLabel?: string;
  children?: ReactNode;
}) {
  const base = useMemo(() => {
    const v: Values = {};
    for (const f of fields) {
      const existing = initial?.[f.name];
      v[f.name] =
        existing ?? (f.type === "switch" ? true : f.type === "number" ? 0 : "");
    }
    return v;
  }, [fields, initial]);

  const [values, setValues] = useState<Values>(base);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setValues(base);
  }, [open, base]);

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function submit() {
    for (const f of fields) {
      if (f.required && !String(values[f.name] ?? "").trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setBusy(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.name}
              className={cn("space-y-1.5", (f.span ?? 1) === 2 && "sm:col-span-2")}
            >
              <Label className="text-[12px] font-semibold">{f.label}</Label>
              <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
              {f.help && <p className="text-[11px] text-muted-foreground">{f.help}</p>}
            </div>
          ))}
        </div>

        {children}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false);

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          rows={4}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={field.placeholder ?? "Select…"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "switch":
      return (
        <div className="flex h-9 items-center gap-2">
          <Switch checked={!!value} onCheckedChange={onChange} />
          <span className="text-[12px] text-muted-foreground">{value ? "Enabled" : "Disabled"}</span>
        </div>
      );
    case "number":
      return (
        <Input
          type="number"
          className="h-9 num"
          value={String(value ?? 0)}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );
    case "date":
      return (
        <Input
          type="date"
          className="h-9"
          value={String(value ?? "").slice(0, 10)}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case "image":
      return (
        <div className="flex items-center gap-3">
          {value ? (
            <StoredImage
              path={String(value)}
              alt="Preview"
              className="h-14 w-20 rounded-md border border-border object-cover"
            />
          ) : null}
          <label className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:border-border-strong">
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  onChange(await uploadMedia(file));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
          {value ? (
            <button
              type="button"
              className="text-[12px] text-muted-foreground hover:text-destructive"
              onClick={() => onChange("")}
            >
              Remove
            </button>
          ) : null}
        </div>
      );
    default:
      return (
        <Input
          type={field.type === "email" ? "email" : "text"}
          className="h-9"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function ConfirmDelete({
  open,
  onOpenChange,
  label,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label: string;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {label}?</DialogTitle>
          <DialogDescription>
            This permanently removes the record and any data linked to it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Delete failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
