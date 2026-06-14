"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportResultsTable } from "@/components/users/import-results-table";
import { ImportUsersForm } from "@/components/users/import-users-form";
import type { ImportResult } from "@/services/user.types";
import { useState } from "react";
import { ServerActionResult } from "../action-form";

export function ImportUsersSection() {
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleSuccess(res: ServerActionResult & { result?: ImportResult }) {
    setResult(res.result ?? null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import users from CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImportUsersForm onSuccess={handleSuccess} />
        {result && <ImportResultsTable result={result} />}
      </CardContent>
    </Card>
  );
}
