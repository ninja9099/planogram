export const ShelfTypes = {
  top: "TOP",
  middle: "MIDDLE",
  bottom: "BOTTOM",
  full: "FULL",
  priceTag: "PRICETAG",
}


export const shelfConfig = {
  grid: 1,
  shelves: [
    {width: 900, height: 200, shelfType: ShelfTypes.top},
    {width: 900, height: 200, shelfType: ShelfTypes.middle},
    {width: 900, height: 200, shelfType: ShelfTypes.bottom},
    {width: 900, height: 20, shelfType: ShelfTypes.priceTag},
  ]
};

export const productCatalouge = {
        products: {
            chips: [
                {product_id: 1, width: 50, height: 100, name: 'chips1', image: 'https://picsum.photos/200/300'},
                {product_id: 1, width: 50, height: 100, name: 'chips2', image: 'https://picsum.photos/200/300'},
                {product_id: 1, width: 50, height: 100, name: 'chips3', image: 'https://picsum.photos/200/300'}
            ],
            wafers: [
                {product_id: 1, width: 50, height: 100, name: 'chips1', image: 'https://picsum.photos/200/300'},
                {product_id: 1, width: 50, height: 100, name: 'chips2', image: 'https://picsum.photos/200/300'},
                {product_id: 1, width: 50, height: 100, name: 'chips3', image: 'https://picsum.photos/200/300'}
            ]
        }
    }
