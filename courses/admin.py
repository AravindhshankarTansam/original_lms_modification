from django.contrib import admin
from .models import Course, Module, Chapter, Question, Category, SubCategory


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'created_by',
        'level',
        'status',
        'rating',
        'review_count',
        'created_at',
        'updated_at',
    )
    list_filter = ('status', 'level', 'created_by')
    search_fields = ('title', 'description', 'category_names', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'overview', 'requirements')
        }),
        ('Category & Level', {
            'fields': ('category_names', 'level', 'badge')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Status & Creator', {
            'fields': ('status', 'created_by', 'students')
        }),
        ('Statistics', {
            'fields': ('rating', 'review_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    filter_horizontal = ('students',)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    ordering = ('course',)


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'material_type', 'duration')
    list_filter = ('material_type', 'module__course')
    search_fields = ('title', 'module__title', 'module__course__title')
    readonly_fields = ('duration',)
    ordering = ('module',)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'module', 'question_type', 'correct_answer')
    list_filter = ('question_type', 'module__course')
    search_fields = ('question_text', 'module__title', 'module__course__title')
    ordering = ('module',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'category__name')
    ordering = ('category', 'name')
