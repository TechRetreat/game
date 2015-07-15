json.array!(@tanks) do |tank|
  json.extract! tank, :id, :name
  json.url tank_url(tank, format: :json)
end
