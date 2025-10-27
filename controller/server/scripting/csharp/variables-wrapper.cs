using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Static service class that provides methods for managing variables through API calls
/// </summary>
public static class Variables
{
    private static readonly HttpClient _httpClient = new HttpClient();
    private static string _defaultApiUrl = "http://db:8000";

    /// <summary>
    /// Configure the default API URL for all operations
    /// </summary>
    /// <param name="apiUrl">The base API URL to use</param>
    public static void Configure(string apiUrl)
    {
        _defaultApiUrl = apiUrl ?? throw new ArgumentNullException(nameof(apiUrl));
    }

    /// <summary>
    /// Get the current default API URL
    /// </summary>
    /// <returns>The current default API URL</returns>
    public static string GetDefaultApiUrl() => _defaultApiUrl;

    /// <summary>
    /// Get a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to retrieve</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The retrieved variable data</returns>
    public static async Task<JsonElement?> GetVariableAsync(string name, string apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var response = await _httpClient.GetAsync($"{baseUrl}/variables/{name}");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<JsonElement>(content);
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine($"Resource with name {name} not found in variables.");
                return null;
            }
            else
            {
                throw new HttpRequestException($"Error retrieving variable {name}: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in GetVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all variables
    /// </summary>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>All variables data</returns>
    public static async Task<JsonElement> GetAllVariablesAsync(string apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var response = await _httpClient.GetAsync($"{baseUrl}/variables");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in GetAllVariablesAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Create a new variable - matches Python implementation exactly
    /// </summary>
    /// <param name="data">The variable data to create (should be a dictionary-like object with name, value, type, etc.)</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The created variable data</returns>
    public static async Task<JsonElement> CreateVariableAsync(object data, string apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{baseUrl}/variables", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.Error.WriteLine($"API Error {response.StatusCode}: {errorContent}");
                Console.Error.WriteLine($"Sent JSON: {json}");
            }
            
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(responseContent);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in CreateVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Update a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to update</param>
    /// <param name="newValue">The new value for the variable</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The updated variable data</returns>
    public static async Task<JsonElement> UpdateVariableAsync(string name, object newValue, string apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var variable = new { value = newValue };
            var json = JsonSerializer.Serialize(variable);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"{baseUrl}/variables/{name}", content);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(responseContent);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in UpdateVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Delete a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to delete</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The response from the delete operation</returns>
    public static async Task<JsonElement> DeleteVariableAsync(string name, string apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var response = await _httpClient.DeleteAsync($"{baseUrl}/variables/{name}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in DeleteVariableAsync: {ex.Message}");
            throw;
        }
    }
}