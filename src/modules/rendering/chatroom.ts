function setWidth(elementList: HTMLCollectionOf<HTMLElement>, width: string) {
  Array.from(elementList).forEach((element: HTMLElement) => {
    element.style.width = width;
  });
}

export function fixChatRoomWidth() {
  const centerElements = document.getElementsByClassName(
    ".room-component-center"
  ) as HTMLCollectionOf<HTMLElement>;

  if (document.querySelector(".room-component-right")) {
    setWidth(centerElements, "calc(100% - 400px)");
  } else setWidth(centerElements, "100%");
}
