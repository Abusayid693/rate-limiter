import React, { useState, useEffect } from "react";
import { Login } from "./components/login";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { Main } from "./container/main";

const Index = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  return (
    <>
      <SnackbarProvider
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {!phoneNumber ? (
          <Login setPhoneNumber={setPhoneNumber} />
        ) : (
          <Main phoneNumber={phoneNumber} />
        )}
      </SnackbarProvider>
    </>
  );
};

export default Index;
