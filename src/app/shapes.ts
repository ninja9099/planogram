import { dia, shapes, V } from '@clientio/rappid';

export interface Shelf {
    width: number;
    height: number;
    shelfType: ShelfTypes;
}

export interface Product {
    width: number;
    height: number;
    name: string;
    image: string;
}

export enum ShelfTypes {
    top = 'TOP',
    middle = 'MIDDLE',
    bottom = 'BOTTOM',
    full = 'FULL',
}

export enum ProductCategories {
    chips = 'CHIPS',
    nachos = 'NACHOS',
    bombay_mix = 'BOMBAY MIX',
    snacks = 'SNACKS',
    candy = 'CANDY',
    sports_drink = 'SPORTS DRINK',
    soda = 'SODA',
    cordial = 'CORDIAL',
    cola = 'COLA',
    pop = 'POP',
    ice_tea = 'ICE TEA',
}

interface StoreItemsConfig {
    grid: number;
    shelves: Shelf[];
    products: Record<string, Product[]>;
}

export const storeItemsConfig: StoreItemsConfig = {
    grid: 30,
    shelves: [
        { width: 10, height: 5, shelfType: ShelfTypes.full },
        { width: 10, height: 5, shelfType: ShelfTypes.top },
        { width: 10, height: 5, shelfType: ShelfTypes.middle },
        { width: 10, height: 5, shelfType: ShelfTypes.bottom }
    ],
    products: {
        chips: [
            { width: 2, height: 3, name: 'chips1', image: 'assets/products/chips/1.svg' },
            { width: 2, height: 3, name: 'chips2', image: 'assets/products/chips/2.svg' },
            { width: 2, height: 3, name: 'chips3', image: 'assets/products/chips/3.svg' }
        ],
        nachos: [
            { width: 2, height: 3, name: 'nachos1', image: 'assets/products/nachos/1.svg' },
            { width: 2, height: 3, name: 'nachos2', image: 'assets/products/nachos/2.svg' },
            { width: 2, height: 3, name: 'nachos3', image: 'assets/products/nachos/3.svg' }
        ],
        bombay_mix: [
            { width: 2, height: 3, name: 'bombay_mix1', image: 'assets/products/bombay_mix/1.svg' },
            { width: 2, height: 3, name: 'bombay_mix2', image: 'assets/products/bombay_mix/2.svg' },
            { width: 2, height: 3, name: 'bombay_mix3', image: 'assets/products/bombay_mix/3.svg' }
        ],
        snacks: [
            { width: 2, height: 2, name: 'nuts', image: 'assets/products/snacks/1.svg' },
            { width: 2, height: 2, name: 'biscuit', image: 'assets/products/snacks/2.svg' },
            { width: 2, height: 3, name: 'chocolate', image: 'assets/products/snacks/3.svg' },
        ],
        candy: [
            { width: 2, height: 3, name: 'candy1', image: 'assets/products/candy/1.svg' },
            { width: 2, height: 3, name: 'candy2', image: 'assets/products/candy/2.svg' },
            { width: 2, height: 3, name: 'candy3', image: 'assets/products/candy/3.svg' }
        ],
        sports_drink: [
            { width: 1, height: 3, name: 'sports_drink1', image: 'assets/products/sports_drink/1.svg' },
            { width: 1, height: 3, name: 'sports_drink2', image: 'assets/products/sports_drink/2.svg' },
            { width: 1, height: 3, name: 'sports_drink3', image: 'assets/products/sports_drink/3.svg' },
            { width: 1, height: 3, name: 'sports_drink4', image: 'assets/products/sports_drink/4.svg' },
            { width: 1, height: 3, name: 'sports_drink5', image: 'assets/products/sports_drink/5.svg' }
        ],
        soda: [
            { width: 1, height: 2, name: 'soda1', image: 'assets/products/soda/1.svg' },
            { width: 1, height: 2, name: 'soda2', image: 'assets/products/soda/2.svg' },
            { width: 1, height: 2, name: 'soda3', image: 'assets/products/soda/3.svg' }
        ],
        cordial: [
            { width: 1, height: 4, name: 'cordial1', image: 'assets/products/cordial/1.svg' },
            { width: 1, height: 4, name: 'cordial2', image: 'assets/products/cordial/2.svg' },
            { width: 1, height: 4, name: 'cordial3', image: 'assets/products/cordial/3.svg' }
        ],
        cola: [
            { width: 1, height: 3, name: 'cola1', image: 'assets/products/cola/1.svg' },
            { width: 1, height: 3, name: 'cola2', image: 'assets/products/cola/2.svg' }
        ],
        pop: [
            { width: 1, height: 3, name: 'pop1', image: 'assets/products/pop/1.svg' },
            { width: 1, height: 3, name: 'pop2', image: 'assets/products/pop/2.svg' },
            { width: 1, height: 3, name: 'pop3', image: 'assets/products/pop/3.svg' }
        ],
        ice_tea: [
            { width: 1, height: 3, name: 'ice_tea1', image: 'assets/products/ice_tea/1.svg' },
            { width: 1, height: 3, name: 'ice_tea2', image: 'assets/products/ice_tea/2.svg' },
            { width: 1, height: 3, name: 'ice_tea3', image: 'assets/products/ice_tea/3.svg' },
            { width: 1, height: 3, name: 'ice_tea4', image: 'assets/products/ice_tea/4.svg' }
        ]
    }
};


export const getAllProducts = (): Record<string, ProductElement[]> => {
    const products = {};
    Object.keys(storeItemsConfig.products).forEach((category: string) => {
        const productCategory = storeItemsConfig.products[category];
        productCategory.forEach((product: Product) => {
            const productShape = ProductElement.create(product);
            // @ts-ignore
          products[category] = products[category] || [];
            // @ts-ignore
          products[category].push(productShape);
        });
    });
    return products;
};

export const getAllShelves = (shelves: Shelf[]): ShelfElement[] => {
    return Object.values(shelves).map(shelf => {
        switch (shelf.shelfType) {
            case ShelfTypes.full:
                return ShelfElement.create(shelf)
                    .translate(20, 50)
                    .attr(['top', 'display'], 'block')
                    .attr(['bottom', 'display'], 'block');
            case ShelfTypes.top:
                return ShelfElement.create(shelf)
                    .attr(['top', 'display'], 'block')
                    .translate(20, 280);
            case ShelfTypes.bottom:
                return ShelfElement.create(shelf)
                    .attr(['bottom', 'display'], 'block')
                    .translate(20, 660);
            default:
            case ShelfTypes.middle:
                return ShelfElement.create(shelf)
                    .translate(20, 470);
        }
    });
}

const calcSize = (size: dia.Size): dia.Size => {
    const { grid } = storeItemsConfig;
    return {
        width: size.width * grid,
        height: size.height * grid
    };
};

const bg = '#DBDFEE';
const fg = '#CACCD4';

export class ShelfElement extends dia.Element {
  override markup = [{
        tagName: 'g',
        selector: 'top',
        children: [{
            tagName: 'rect',
            selector: 'topBackground'
        }, {
            tagName: 'rect',
            selector: 'topForeground'
        }]
    }, {
        tagName: 'rect',
        selector: 'bottom'
    }, {
        tagName: 'rect',
        selector: 'middle'
    }];

  override defaults() {
        return {
            ...super.defaults,
            type: 'app.Shelf',
            attrs: {
                root: {
                    containerSelector: 'middle'
                },
                top: {
                    display: 'none',
                    refY: -30
                },
                topForeground: {
                    refWidth: '100%',
                    refWidth2: -2,
                    y: 1,
                    x: 1,
                    height: 25,
                    rx: 4,
                    ry: 4,
                    fillPattern: 'assets/shelf/marquee.svg',
                },
                topBackground: {
                    refWidth: '100%',
                    height: 35,
                    rx: 4,
                    ry: 4,
                    fill: bg,
                    stroke: fg,
                    strokeWidth: 2
                },
                middle: {
                    refHeight: '100%',
                    refWidth: '100%',
                    stroke: fg,
                    fill: '#F5F6FA',
                    strokeWidth: 2,
                },
                bottom: {
                    display: 'none',
                    refWidth: '100%',
                    refY: '100%',
                    y: -5,
                    height: 20,
                    rx: 4,
                    ry: 4,
                    fill: bg,
                    strokeWidth: 2,
                    stroke: fg
                }
            }
        }
    }

    static attributes = {
        fillPattern: {
            set: function(image: string): { fill: string } {
                const { paper } = this as any;
                const MARGIN = 0;
                const width = 60;
                const height = 26;
                const patternId = image + paper.cid;
                if (!paper.isDefined(patternId)) {
                    V('pattern', {
                        'id': patternId,
                        'width': width,
                        'height': height,
                        'patternUnits': 'userSpaceOnUse'
                    }, [
                        V('rect', {
                            'y': 4,
                            'width': width,
                            'height': height - 8,
                            'fill': '#AFB6D6'
                        }),
                        V('image', {
                            'xlink:href': image,
                            'preserveAspectRatio': 'none',
                            'x': MARGIN / 2,
                            'y': MARGIN / 2,
                            'width': width - MARGIN,
                            'height': height - MARGIN
                        })
                    ]).appendTo(paper.defs);
                }
                return {
                    'fill': `url(#${patternId})`
                };
            }
        }
    }

    static create(shelf: Shelf): ShelfElement {
        const { shelfType } = shelf;
        return new this({
            shelfType,
            size: calcSize(shelf)
        });
    }
}

export class ProductElement extends dia.Element {

  override markup = [{
        tagName: 'rect',
        selector: 'body'
    }]

  override defaults() {
        return {
            ...super.defaults,
            type: 'app.Product',
            attrs: {
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    strokeWidth: 2,
                    stroke: 'none'
                }
            }
        }
    }

    public match(group: string, keyword: string) {
        if (this.get('productType').includes(keyword.toLowerCase())) return true;
        // @ts-ignore
      if (ProductCategories[group].includes(keyword.toUpperCase())) return true;
        return false;
    }

    static attributes = {
        productImage: {
            set: function (image: string): { fill: string } {
                const { paper, model } = this as any;
                const MARGIN = 8;
                const { width, height } = calcSize(model.get('productSize'));
                const patternId = image + paper.cid;
                if (!paper.isDefined(patternId)) {
                    V('pattern', {
                        'id': patternId,
                        'width': width,
                        'height': height,
                        'patternUnits': 'userSpaceOnUse'
                    }, [
                        /* Optional background for images
                        V('rect', {
                            'x': 2,
                            'y': 2,
                            'width': width - 4,
                            'height': height - 4,
                            'fill': '#FFFFFF'
                        }),
                        */
                        V('image', {
                            'xlink:href': image,
                            'preserveAspectRatio': 'none',
                            'x': MARGIN / 2,
                            'y': MARGIN / 2,
                            'width': width - MARGIN,
                            'height': height - MARGIN
                        })
                    ]).appendTo(paper.defs);
                }
                return {
                    'fill': `url(#${patternId})`
                };
            }
        }
    }

    static create(product: Product): ProductElement {
        const { name, width, height, image } = product;
        return new this({
            productType: name,
            productSize: { width, height },
            size: calcSize(product),
            attrs: {
                body: {
                    productImage: image
                }
            }
        });
    }
}

Object.assign(shapes, {
    app: {
        Shelf: ShelfElement,
        Product: ProductElement
    }
});
