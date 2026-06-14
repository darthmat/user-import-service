"use client";

import { importUsersAction } from "@/actions/import-users.action";
import { ActionForm, ServerActionResult } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImportResult } from "@/services/user.types";

const DELIMITERS = [
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe (|)" },
];

interface ImportUsersFormProps {
  onSuccess?: (result: ServerActionResult & { result?: ImportResult }) => void;
}

export function ImportUsersForm({ onSuccess }: ImportUsersFormProps) {
  return (
    <ActionForm action={importUsersAction} onSuccess={onSuccess}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">CSV file</Label>
          <Input id="file" name="file" type="file" accept=".csv" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="delimiter">Delimiter</Label>
          <Select name="delimiter" defaultValue=",">
            <SelectTrigger id="delimiter">
              <SelectValue placeholder="Select delimiter" />
            </SelectTrigger>
            <SelectContent>
              {DELIMITERS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Import</Button>
      </div>
    </ActionForm>
  );
}
