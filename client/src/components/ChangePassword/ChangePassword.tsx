import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import useAuth from "../../hooks/useAuth";

interface PasswordChangeResponse {
  error: boolean;
  message: string;
}

export function ChangePassword() {
  const { changePassword, loading, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      showErrorToast("Both passwords are required");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/change-password?email=${
          user?.email
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data: PasswordChangeResponse = await response.json();

      if (!data.error) {
        try {
          await changePassword(currentPassword, newPassword);
          showSuccessToast(data.message);
          navigate("/");
        } catch (error) {
          showErrorToast((error as Error).message);
        }
      } else {
        showErrorToast(data.message);
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  return (
    <div
      className="flex justify-center items-center w-full"
      style={{ height: "calc(100vh - 90px)" }}
    >
      <Card className="w-[350px] mx-auto">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSavePassword}
            disabled={loading || !currentPassword || !newPassword}
            className="w-full"
          >
            {loading ? "Processing..." : "Save password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
