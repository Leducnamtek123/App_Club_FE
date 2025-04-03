import apiService from "@/lib/api/api";

export const getNewsById = async (newsId: string) => {
    try {
        const response = await apiService.get(`/news/${newsId}`);
        console.log("API", response);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAllNews = async ({
    page = 1,
    take = 10,
    q = "",
    order = undefined,
    isPublished = undefined,
    category = undefined,
}: {
    page?: number;
    take?: number;
    q?: string;
    order?: string;
    isPublished?: boolean;
    category?: string;
}) => {
    try {
        const params: { [key: string]: any } = { page, take };
        if (q) params.q = q;
        if (order) params.order = order;
        if (isPublished) params.isPublished = isPublished;
        if (category) params.category = category;
        const response = await apiService.get("/news", params);
        return response;
    } catch (error) {
        return error;
    }
};

export const createNews = async (data: FormData) => {
    try {
        const response = await apiService.post("/news", data, {
            contentType: "multipart/form-data",
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateNews = async (newsId: string, data: FormData) => {
    try {
        const response = await apiService.patch(`/news/${newsId}`, data,{
            contentType: "multipart/form-data",
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteNews = async (newsId: string) => {
    try {
        const response = await apiService.delete(`/news/${newsId}`);
        return response;
    } catch (error) {
        throw error;
    }
};