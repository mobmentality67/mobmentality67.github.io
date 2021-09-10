#include "buffs.h"

Buff buff_list[] =
{ // ID        Str  Ag  AP  C% CR Hit SpC Ag% Str% Dm% H% +DM 
  {  25289, {   0,   0, 376, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Battle Shout
  {  17007, {   0,   0,   0, 5, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Leader of the Pack
  {   9885, {  18,  18,   0, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Mark of the Wild
  {  20217, {   0,   0,   0, 0, 0, 0,  0, 10, 10,  0,  0, 0 } },  // Blessing of Kings
  {  19838, {   0,   0, 220, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Blessing of Might
  {  10627, {   0,  77,   0, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Grace of Air Totem
  {  10442, {  86,   0,   0, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Strength of Earth Totem
  {  13452, {   0,  25,   0, 0, 28, 0,  0,  0,  0,  0,  0, 0 } }, // Elixir of the Mongoose
  {  22831, {   0,  35,   0, 0, 20, 0,  0,  0,  0,  0,  0, 0 } }, // Elixir of Major Agility
  {  27664, {   0,  20,   0, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Grilled Mudfish
  {  27658, {   20,   0,   0, 0, 0, 0,  0,  0,  0,  0,  0, 0 } },  // Roasted Clefthoof
};

static_vector<Buff> Buffs = buff_list;
