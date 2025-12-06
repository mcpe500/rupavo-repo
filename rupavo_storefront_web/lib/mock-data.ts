export interface Store {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

export const mockStores: Store[] = [
    {
        id: "1",
        name: "Tech Haven",
        description: "Your one-stop shop for the latest gadgets and electronics.",
        imageUrl: "https://images.unsplash.com/photo-1531297461136-82lwDe43ZJ9c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRlY2h8ZW58MHx8MHx8fDA%3D",
    },
    {
        id: "2",
        name: "Green Valley Organics",
        description: "Fresh, locally sourced organic fruits and vegetables.",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvY2VyeXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
        id: "3",
        name: "The Book Nook",
        description: "A cozy corner for book lovers with a wide collection of genres.",
        imageUrl: "https://images.unsplash.com/photo-1507842217121-9e93dd2ccd08?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9va3N0b3JlfGVufDB8fDB8fHww",
    },
    {
        id: "4",
        name: "Urban Style",
        description: "Trendy fashion for the modern urbanite.",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdGhpbmclMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
        id: "5",
        name: "Cafe Delight",
        description: "Artisan coffee and homemade pastries.",
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
        id: "6",
        name: "Gadget Guru",
        description: "Expert repairs and accessories for all your devices.",
        imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVwYWlyJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D",
    },
];
