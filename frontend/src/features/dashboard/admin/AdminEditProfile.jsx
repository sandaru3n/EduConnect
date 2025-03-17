//frontend/src/features/dashboard/admin/AdminEditProfile.jsx
import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";


const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    avatar: "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg",
  });
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  const [avatarFile, setAvatarFile] = useState(null); // Fixed: Added avatarFile variable
  const [loading, setLoading] = useState(false);
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = { ...user, name, email };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }

    setLoading(false);
  };


  return (
    
    <Box
      sx={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 3,
        mt: 10,
      }}
    >  
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Profile
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profileData.avatar}
                sx={{ width: 100, height: 100 }}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "background.paper",
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <PhotoCamera />
              </IconButton>
            </Box>
          </Box>
        </Box>




        {/* Profile Update Form */}
        <Box component="form" onSubmit={handleProfileUpdate} sx={{ marginBottom: 3 }}>
            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </Box>






        
      </Paper>
    </Box>
    
  );
};

export default EditProfile;