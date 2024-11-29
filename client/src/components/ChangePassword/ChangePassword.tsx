import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
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
import { AuthContext } from "../../providers/AuthProvider";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

export function ChangePassword() {
  //@ts-ignore
  const { changePassword, loading, user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSavePassword = async () => {
    try {
      fetch(
        `${import.meta.env.VITE_API_URL}/change-password?email=${user?.email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            changePassword(currentPassword, newPassword)
              .then((_res: any) => {
                navigate("/");
                showSuccessToast(`${data.message}`);
              })
              .catch((error: any) => {
                console.log(error);
              });
          } else {
            showErrorToast(`${data.message}`);
          }
        });
    } catch (error) {}
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
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePassword}>
            {loading ? "processing..." : "Save password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
