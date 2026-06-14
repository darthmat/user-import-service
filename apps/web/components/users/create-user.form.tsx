import { createUserAction } from "@/actions/create-user.action";
import { ActionForm } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateUserForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add user</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionForm action={createUserAction}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit">Create user</Button>
          </div>
        </ActionForm>
      </CardContent>
    </Card>
  );
}
