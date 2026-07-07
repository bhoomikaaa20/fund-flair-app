import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile — Ledger" }] }),
});

function Profile() {
  const { user } = useAuth();
  const uid = user?._id;

  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setPhone(profile.phone ?? "");
      setAvatarUrl(profile.avatarUrl ?? null);
    }
  }, [profile]);

  const signedAvatar = avatarUrl
    ? `http://localhost:5000/uploads/${avatarUrl}`
    : null;

  const saveProfile = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/profile",
        {
          fullName,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },

    onSuccess: () => {
      toast.success("Profile updated");

      qc.invalidateQueries({
        queryKey: ["profile", uid],
      });
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to update profile"
      );
    },
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/profile/password",
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },

    onSuccess: () => {
      toast.success("Password updated");
      setPassword("");
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
        "Unable to update password"
      );
    },
  });

  const uploadAvatar = async (file: File) => {
    if (!uid) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maximum file size is 5MB");
      return;
    }

    const formData = new FormData();

    formData.append("avatar", file);

    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/profile/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAvatarUrl(data.avatarUrl);

      toast.success("Profile picture updated");

      qc.invalidateQueries({
        queryKey: ["profile", uid],
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Upload failed"
      );
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-secondary text-2xl font-medium text-muted-foreground">
              {signedAvatar ? (
                <img
                  src={signedAvatar}
                  alt="Profile"
                  className="size-full object-cover"
                />
              ) : (
                fullName?.[0]?.toUpperCase() ?? "?"
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow"
              aria-label="Change photo"
            >
              <Camera className="size-4" />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadAvatar(e.target.files[0]);
                }
              }}
            />
          </div>

          <div>
            <div className="font-medium">
              {fullName || "Unnamed"}
            </div>

            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      <form
        className="space-y-4 rounded-2xl border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile.mutate();
        }}
      >
        <h2 className="font-medium">Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>

            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>

            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </form>

      <form
        className="space-y-4 rounded-2xl border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          changePassword.mutate();
        }}
      >
        <h2 className="font-medium">
          Change Password
        </h2>

        <div className="max-w-sm space-y-1.5">
          <Label>New Password</Label>

          <Input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            minLength={6}
            maxLength={72}
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          disabled={
            changePassword.isPending || !password
          }
        >
          {changePassword.isPending
            ? "Updating..."
            : "Update Password"}
        </Button>
      </form>
    </div>
  );
}