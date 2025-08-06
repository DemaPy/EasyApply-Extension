function useLocalState<T>(externalValue: T): [T, (val: T) => void] {
  const [state, setState] = React.useState(externalValue);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setState(externalValue);
  }, [externalValue]);

  return [state, setState];
}
