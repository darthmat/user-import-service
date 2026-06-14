import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImportResult } from "@/services/user.types";

interface ImportResultsTableProps {
  result: ImportResult;
}

export function ImportResultsTable({ result }: ImportResultsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge variant="default">Succeeded: {result.succeeded.length}</Badge>
        <Badge variant="destructive">Failed: {result.failed.length}</Badge>
      </div>

      {result.succeeded.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.succeeded.map((s) => (
              <TableRow key={s.row}>
                <TableCell>{s.row}</TableCell>
                <TableCell>{s.user.username}</TableCell>
                <TableCell>{s.user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {result.failed.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.failed.map((f) => (
              <TableRow key={f.row}>
                <TableCell>{f.row}</TableCell>
                <TableCell>{f.dto.username ?? "-"}</TableCell>
                <TableCell>{f.dto.email ?? "-"}</TableCell>
                <TableCell className="text-destructive">{f.error}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
