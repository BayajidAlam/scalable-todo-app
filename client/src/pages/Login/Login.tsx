/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema } from "../../schemas/login";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Form } from "../../components/ui/form";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import useAuth from "../../hooks/useAuth";

const Login = () => {

  const { logInUser, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    console.log(data, "user data");
    try {
      logInUser(data.email, data.password)
        .then((result: any) => {
          if (result?.user?.email) {
            showSuccessToast("Successfully logged in!");
            navigate(from, { replace: true });
          }
        })
        .catch((error: any) => {
          showErrorToast(error?.message);
        });
    } catch (error) {
      console.log(error, "error");
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">User Name</Label>
                  <Input
                    id="email"
                    placeholder="john doe"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="******"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
            <p className="my-2 text-center">
              New to Neep?{" "} 
              <Link className="font-semibold" to="/registration">
                Create account
              </Link>
            </p>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
