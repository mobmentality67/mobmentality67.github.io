#pragma once

struct Talents
{
    // Balance
    int naturesgrasp = 0;

    // Feral Combat
    int ferocity = 0;
    int feralaggression = 0;
    double feralinstinctmod = 1.0;
    double thickhidemod = 1.0;
    int feralswiftnessmod = 0;
    int sharpenedclawsmod = 0;
    int shreddingattacks = 0;
    int predatorystrikesmod = 0;
    int primalfury = 0;
    double savagefurymod = 1.0;
    int heartofthewild = 0;
    int survivalofthefittest = 0;
    int lotp = 0;
    int predatoryinstincts = 0;
    int mangle = 0;

    // Restoration
    double naturalistmod = 0;
    double nssmod = 0;
    int intensity = 0;
    int ooc = 0;

    void add( int i, int count )
    {
        switch ( i )
        {
        // Feral Combat
        case 112: naturesgrasp = count; break;

        // Feral Combat
        case 211: ferocity = count; break;
        case 212: feralaggression = count;
        case 221: feralinstinctmod =  1 + double(count) * 0.05f; break;
        case 223: thickhidemod =  1 + double(count) * 0.3333f; break;
        case 231: feralswiftnessmod = 2 * count; break;
        case 233: sharpenedclawsmod = 2 * count; break;
        case 241: shreddingattacks = count; break;
        case 242: predatorystrikesmod = double(count) * 0.5 * 70.0f; break;
        case 243: primalfury = count; break;
        case 251: savagefurymod = 1.0 + 0.1*double(count);
        case 261: heartofthewild = count; break;
        case 262: survivalofthefittest = count; break;
        case 272: lotp = count; break;
        case 281: predatoryinstincts = count; break;
        case 291: mangle = count; break;

        // Restoration
        case 321: naturalistmod = 1.0 + 0.2*count; break;
        case 331: intensity = count; break;
        case 333: ooc = count; break;
        }
    }
};
