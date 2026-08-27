import sys

with open('src/api/villageApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "async delete(id: string): Promise<void> {\n    await apiClient.delete(`/villages/${id}`);\n  }",
    "async delete(id: string, force?: boolean): Promise<void> {\n    await apiClient.delete(`/villages/${id}${force ? '?force=true' : ''}`);\n  }"
)

with open('src/api/villageApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated villageApi.ts")
