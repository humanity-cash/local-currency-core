import { useEffect, useState } from "react";
import { MockUserData } from "../mock";
import { UserData } from "../types";

const useUsersData = (): UserData[] => {
  const [userData, setUserData] = useState<UserData[]>([]);
  useEffect(() => {
    setUserData(MockUserData);
  }, []);

  return userData;
};

export default useUsersData;
