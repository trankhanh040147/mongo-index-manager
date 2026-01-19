import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

export const useRequireDatabase = () => {
  const navigate = useNavigate();
  const currentDatabase = useSelector((state) => state.Databases.current);

  useEffect(() => {
    if (!currentDatabase?.id) {
      navigate("/databases");
    }
  }, [currentDatabase?.id, navigate]);

  return currentDatabase;
};

export const useRequireDatabaseAndCollection = () => {
  const navigate = useNavigate();
  const currentDatabase = useSelector((state) => state.Databases.current);
  const currentCollection = useSelector((state) => state.Collections.current);

  useEffect(() => {
    if (!currentDatabase?.id) {
      navigate("/databases");
      return;
    }
    if (!currentCollection) {
      navigate("/collections");
    }
  }, [currentDatabase?.id, currentCollection, navigate]);

  return {currentDatabase, currentCollection};
};

